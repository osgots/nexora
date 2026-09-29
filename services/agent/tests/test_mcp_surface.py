import anyio
from mcp import Client

from app.mcp_server import mcp


EXPECTED_TOOLS = {
    "parse_syllabus",
    "create_study_plan",
    "grade_answer",
    "update_learner_mastery",
}


def test_modern_mcp_surface_lists_expected_tools():
    async def scenario():
        async with Client(mcp) as client:
            assert client.protocol_version == "2026-07-28"
            result = await client.list_tools()
            assert EXPECTED_TOOLS.issubset({tool.name for tool in result.tools})

    anyio.run(scenario)


def test_legacy_alexa_compatible_protocol_negotiates_2025_11_25():
    async def scenario():
        async with Client(mcp, mode="legacy") as client:
            assert client.protocol_version == "2025-11-25"
            result = await client.list_tools()
            assert EXPECTED_TOOLS.issubset({tool.name for tool in result.tools})

    anyio.run(scenario)
